//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'password_change_challenge_response.g.dart';

/// PasswordChangeChallengeResponse
///
/// Properties:
/// * [passwordChangeRequired] 
/// * [passwordChangeToken] 
/// * [passwordChangeExpiresIn] 
@BuiltValue()
abstract class PasswordChangeChallengeResponse implements Built<PasswordChangeChallengeResponse, PasswordChangeChallengeResponseBuilder> {
  @BuiltValueField(wireName: r'passwordChangeRequired')
  PasswordChangeChallengeResponsePasswordChangeRequiredEnum get passwordChangeRequired;
  // enum passwordChangeRequiredEnum {  true,  };

  @BuiltValueField(wireName: r'passwordChangeToken')
  String get passwordChangeToken;

  @BuiltValueField(wireName: r'passwordChangeExpiresIn')
  int get passwordChangeExpiresIn;

  PasswordChangeChallengeResponse._();

  factory PasswordChangeChallengeResponse([void updates(PasswordChangeChallengeResponseBuilder b)]) = _$PasswordChangeChallengeResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PasswordChangeChallengeResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PasswordChangeChallengeResponse> get serializer => _$PasswordChangeChallengeResponseSerializer();
}

class _$PasswordChangeChallengeResponseSerializer implements PrimitiveSerializer<PasswordChangeChallengeResponse> {
  @override
  final Iterable<Type> types = const [PasswordChangeChallengeResponse, _$PasswordChangeChallengeResponse];

  @override
  final String wireName = r'PasswordChangeChallengeResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PasswordChangeChallengeResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'passwordChangeRequired';
    yield serializers.serialize(
      object.passwordChangeRequired,
      specifiedType: const FullType(PasswordChangeChallengeResponsePasswordChangeRequiredEnum),
    );
    yield r'passwordChangeToken';
    yield serializers.serialize(
      object.passwordChangeToken,
      specifiedType: const FullType(String),
    );
    yield r'passwordChangeExpiresIn';
    yield serializers.serialize(
      object.passwordChangeExpiresIn,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PasswordChangeChallengeResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PasswordChangeChallengeResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'passwordChangeRequired':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PasswordChangeChallengeResponsePasswordChangeRequiredEnum),
          ) as PasswordChangeChallengeResponsePasswordChangeRequiredEnum;
          result.passwordChangeRequired = valueDes;
          break;
        case r'passwordChangeToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.passwordChangeToken = valueDes;
          break;
        case r'passwordChangeExpiresIn':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.passwordChangeExpiresIn = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PasswordChangeChallengeResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PasswordChangeChallengeResponseBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class PasswordChangeChallengeResponsePasswordChangeRequiredEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const PasswordChangeChallengeResponsePasswordChangeRequiredEnum true_ = _$passwordChangeChallengeResponsePasswordChangeRequiredEnum_true_;

  static Serializer<PasswordChangeChallengeResponsePasswordChangeRequiredEnum> get serializer => _$passwordChangeChallengeResponsePasswordChangeRequiredEnumSerializer;

  const PasswordChangeChallengeResponsePasswordChangeRequiredEnum._(String name): super(name);

  static BuiltSet<PasswordChangeChallengeResponsePasswordChangeRequiredEnum> get values => _$passwordChangeChallengeResponsePasswordChangeRequiredEnumValues;
  static PasswordChangeChallengeResponsePasswordChangeRequiredEnum valueOf(String name) => _$passwordChangeChallengeResponsePasswordChangeRequiredEnumValueOf(name);
}

