//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'password_change_required_dto.g.dart';

/// PasswordChangeRequiredDto
///
/// Properties:
/// * [passwordChangeToken] 
/// * [newPassword] 
@BuiltValue()
abstract class PasswordChangeRequiredDto implements Built<PasswordChangeRequiredDto, PasswordChangeRequiredDtoBuilder> {
  @BuiltValueField(wireName: r'passwordChangeToken')
  String get passwordChangeToken;

  @BuiltValueField(wireName: r'newPassword')
  String get newPassword;

  PasswordChangeRequiredDto._();

  factory PasswordChangeRequiredDto([void updates(PasswordChangeRequiredDtoBuilder b)]) = _$PasswordChangeRequiredDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PasswordChangeRequiredDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PasswordChangeRequiredDto> get serializer => _$PasswordChangeRequiredDtoSerializer();
}

class _$PasswordChangeRequiredDtoSerializer implements PrimitiveSerializer<PasswordChangeRequiredDto> {
  @override
  final Iterable<Type> types = const [PasswordChangeRequiredDto, _$PasswordChangeRequiredDto];

  @override
  final String wireName = r'PasswordChangeRequiredDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PasswordChangeRequiredDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'passwordChangeToken';
    yield serializers.serialize(
      object.passwordChangeToken,
      specifiedType: const FullType(String),
    );
    yield r'newPassword';
    yield serializers.serialize(
      object.newPassword,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PasswordChangeRequiredDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PasswordChangeRequiredDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'passwordChangeToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.passwordChangeToken = valueDes;
          break;
        case r'newPassword':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newPassword = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PasswordChangeRequiredDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PasswordChangeRequiredDtoBuilder();
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


