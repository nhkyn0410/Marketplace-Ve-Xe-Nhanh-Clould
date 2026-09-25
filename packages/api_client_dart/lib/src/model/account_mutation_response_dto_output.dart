//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'account_mutation_response_dto_output.g.dart';

/// AccountMutationResponseDtoOutput
///
/// Properties:
/// * [status] 
@BuiltValue()
abstract class AccountMutationResponseDtoOutput implements Built<AccountMutationResponseDtoOutput, AccountMutationResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'status')
  AccountMutationResponseDtoOutputStatusEnum get status;
  // enum statusEnum {  ok,  };

  AccountMutationResponseDtoOutput._();

  factory AccountMutationResponseDtoOutput([void updates(AccountMutationResponseDtoOutputBuilder b)]) = _$AccountMutationResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccountMutationResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccountMutationResponseDtoOutput> get serializer => _$AccountMutationResponseDtoOutputSerializer();
}

class _$AccountMutationResponseDtoOutputSerializer implements PrimitiveSerializer<AccountMutationResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [AccountMutationResponseDtoOutput, _$AccountMutationResponseDtoOutput];

  @override
  final String wireName = r'AccountMutationResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccountMutationResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(AccountMutationResponseDtoOutputStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AccountMutationResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccountMutationResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccountMutationResponseDtoOutputStatusEnum),
          ) as AccountMutationResponseDtoOutputStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccountMutationResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccountMutationResponseDtoOutputBuilder();
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


class AccountMutationResponseDtoOutputStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ok')
  static const AccountMutationResponseDtoOutputStatusEnum ok = _$accountMutationResponseDtoOutputStatusEnum_ok;

  static Serializer<AccountMutationResponseDtoOutputStatusEnum> get serializer => _$accountMutationResponseDtoOutputStatusEnumSerializer;

  const AccountMutationResponseDtoOutputStatusEnum._(String name): super(name);

  static BuiltSet<AccountMutationResponseDtoOutputStatusEnum> get values => _$accountMutationResponseDtoOutputStatusEnumValues;
  static AccountMutationResponseDtoOutputStatusEnum valueOf(String name) => _$accountMutationResponseDtoOutputStatusEnumValueOf(name);
}

