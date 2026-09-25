//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'employee_create_dto.g.dart';

/// EmployeeCreateDto
///
/// Properties:
/// * [username] 
/// * [contactEmail] 
/// * [role] 
/// * [reason] 
@BuiltValue()
abstract class EmployeeCreateDto implements Built<EmployeeCreateDto, EmployeeCreateDtoBuilder> {
  @BuiltValueField(wireName: r'username')
  String get username;

  @BuiltValueField(wireName: r'contactEmail')
  String get contactEmail;

  @BuiltValueField(wireName: r'role')
  EmployeeCreateDtoRoleEnum get role;
  // enum roleEnum {  DRIVER,  TICKET_STAFF,  SUPPORT_STAFF,  };

  @BuiltValueField(wireName: r'reason')
  String get reason;

  EmployeeCreateDto._();

  factory EmployeeCreateDto([void updates(EmployeeCreateDtoBuilder b)]) = _$EmployeeCreateDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EmployeeCreateDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EmployeeCreateDto> get serializer => _$EmployeeCreateDtoSerializer();
}

class _$EmployeeCreateDtoSerializer implements PrimitiveSerializer<EmployeeCreateDto> {
  @override
  final Iterable<Type> types = const [EmployeeCreateDto, _$EmployeeCreateDto];

  @override
  final String wireName = r'EmployeeCreateDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EmployeeCreateDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'username';
    yield serializers.serialize(
      object.username,
      specifiedType: const FullType(String),
    );
    yield r'contactEmail';
    yield serializers.serialize(
      object.contactEmail,
      specifiedType: const FullType(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(EmployeeCreateDtoRoleEnum),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    EmployeeCreateDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EmployeeCreateDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'username':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.username = valueDes;
          break;
        case r'contactEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.contactEmail = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(EmployeeCreateDtoRoleEnum),
          ) as EmployeeCreateDtoRoleEnum;
          result.role = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  EmployeeCreateDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EmployeeCreateDtoBuilder();
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


class EmployeeCreateDtoRoleEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRIVER')
  static const EmployeeCreateDtoRoleEnum DRIVER = _$employeeCreateDtoRoleEnum_DRIVER;
  @BuiltValueEnumConst(wireName: r'TICKET_STAFF')
  static const EmployeeCreateDtoRoleEnum TICKET_STAFF = _$employeeCreateDtoRoleEnum_TICKET_STAFF;
  @BuiltValueEnumConst(wireName: r'SUPPORT_STAFF')
  static const EmployeeCreateDtoRoleEnum SUPPORT_STAFF = _$employeeCreateDtoRoleEnum_SUPPORT_STAFF;

  static Serializer<EmployeeCreateDtoRoleEnum> get serializer => _$employeeCreateDtoRoleEnumSerializer;

  const EmployeeCreateDtoRoleEnum._(String name): super(name);

  static BuiltSet<EmployeeCreateDtoRoleEnum> get values => _$employeeCreateDtoRoleEnumValues;
  static EmployeeCreateDtoRoleEnum valueOf(String name) => _$employeeCreateDtoRoleEnumValueOf(name);
}

